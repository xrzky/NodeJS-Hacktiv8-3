const { Photo, User } = require('../models/index');

class PhotosController {
  static async findAll(req, res, next) {
    try {
      const photos = await Photo.findAll();
      res.status(200).json(photos);
    } catch (error) {
      next(error);
    }
  }

  static async findById(req, res, next) {
    const { id } = req.params;
    try {
      const photo = await Photo.findByPk(id, {
        attributes: { exclude: ['UserId'] },
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'email']
          }
        ]
      });
      if (!photo) throw { name: 'ErrNotFound' };
      res.status(200).json(photo);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    const { title, image_url } = req.body;
    const UserId = req.user.id;
    try {
      const photo = await Photo.create({ title, image_url, UserId });
      res.status(201).json(photo);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PhotosController;
