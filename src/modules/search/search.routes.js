import { Router } from 'express';
import { tryAuth } from '../../middlewares/auth.js';
import { search } from './search.controller.js';

const searchRouter = Router();
searchRouter.get('/search', tryAuth, search);

export default searchRouter;
