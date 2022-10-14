const { User } = require('../models/index');
const { compare } = require('../helpers/hash');
const { sign } = require('../helpers/jwt');

class UsersController {
  static async signIn(req, res, next) {
    const { email, password } = req.body;
    try {
      if (!email || !password) throw { name: 'EmailOrPasswordEmpty' };
      const user = await User.findOne({ where: { email } });
      if (!user) throw { name: 'EmailNotFound' };
      if (!compare(password, user.password)) throw { name: 'WrongPassword' };
      const token = sign({ id: user.id, email: user.email });
      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  }

  static async signUp(req, res, next) {
    const { username, email, password } = req.body;
    try {
      const user = await User.create({ username, email, password });
      res.status(201).json({
        id: user.id,
        email: user.email
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
