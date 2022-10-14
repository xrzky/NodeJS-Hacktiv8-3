const router = require('express').Router();
const errorMiddleware = require('../middlewares/error-middleware');
const usersRouter = require('./users-router');
const photosRouter = require('./photos-router');

router.use(usersRouter);
router.use('/photos', photosRouter);

router.use((req, res, next) => {
  next({ name: 'PageNotFound' });
});

router.use(errorMiddleware);

module.exports = router;
