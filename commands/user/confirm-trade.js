const updateUserStatsThread = require('lib/users/stats-thread/update');
const createUser = require('lib/users/create');
const templates = require('constants/templates');
const MySQL = require('lib/mysql');

/**
 * @typedef {object} ConfirmTradeCommand
 * @prop {string} [item1]
 * @prop {string} [item2]
 * @prop {number} [trade]
 * @prop {string} user
 * @prop {number} step - `1|2`
 */
/**
 * Confirm a trade that took place off of xyMarket between two users.
 * @param {Snoowrap} r
 * @param {Snoowrap.PrivateMessage|Snoowrap.Comment} message
 * @param {ConfirmTradeCommand} command
 */
module.exports = async function(r, message, command) {
  const db = new MySQL();

  try {
    await db.getConnection();

    if (command.step == 1) {
      // Create both users if needed
      await createUser(message.author.name, db);
      await createUser(command.user, db);

      // Save trade / get id
      const result = await db.query(`INSERT INTO trades SET ?`, {
        trader1: message.author.name,
        trader2: command.user,
        item1: command.item1,
        item2: command.item2
      });

      if (!result.insertId) throw templates.UNEXPECTED_ERROR;

      // Send 'confirm trade' request / command to other user
      await r.composeMessage({
        subject: 'confirm trade for r/xyMarket',
        text: templates.CONFIRM_TRADE_REQUEST({
          item1: command.item1,
          item2: command.item2,
          user: message.author.name,
          id: result.insertId
        }),
        to: command.user
      });

      // Notify current user that a request to confirm the trade has been sent
      await r.composeMessage({
        subject: 'confirm trade request sent',
        text: templates.CONFIRM_TRADE_REQUEST_SENT({
          item1: command.item1,
          item2: command.item2,
          user: command.user
        }),
        to: message.author.name
      });
    } else if (command.step == 2) {
      // Validate that an unconfirmed trade exists between user, other user, at id
      const [trade] = await db.query(
        `
          SELECT * FROM trades
          WHERE id = ? AND trader1 = ? AND trader2 = ? AND confirmed = ?
        `,
        [command.trade, command.user, message.author.name, 0]
      );

      // Validate that other trades between the two users have not taken place within 24 hours
      const rows = await db.query(
        `
          SELECT id FROM trades
          WHERE
            trader1 IN(?) AND trader2 IN(?) AND
            completed > DATE_SUB(NOW(), INTERVAL 1 DAY)
        `,
        new Array(2).fill([command.user, message.author.name])
      );

      if (rows.length) throw templates.TRADE_CONFIRMATION_LIMIT_HIT;

      // Confirm trade, set completed
      await db.query(
        'UPDATE trades SET confirmed = ?, completed = NOW() WHERE id = ?',
        [1, command.trade]
      );

      // Update stats threads for both users
      await updateUserStatsThread(message.author.name, db);
      await updateUserStatsThread(command.user, db);

      // Notify both users that the trade was confirmed
      const text = templates.TRADE_CONFIRMED(trade);

      // Reply publicly
      if (message.was_comment) {
        await message.reply(text);
      }
      // Send private messages
      else {
        await r.composeMessage({
          subject: 'trade confirmed on r/xyMarket',
          text,
          to: command.user
        });
        await r.composeMessage({
          subject: 'trade confirmed on r/xyMarket',
          text,
          to: message.author.name
        });
      }
    }

    db.release();
  } catch (err) {
    db.release();

    if (typeof err != 'string')
      return console.error('commands/user/confirm-trade', err);

    message.reply(err);
  }
};
