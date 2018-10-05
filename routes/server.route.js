import express from 'express';

/* import controller file */
import * as mainController from '../controllers/main.controller';

/* get an instance of express router */
const router = express.Router();

/* API Routes */ 
router.route('/getUsers').get(mainController.getUsers);
router.route('/saveTransaction').post(mainController.saveTransaction);

export default router;