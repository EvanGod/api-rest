import { Router } from "express";
const router = Router();

import * as tableCtrl from '../controllers/tables.controller.js';
import { authJwt } from "../middlewares/index.js";

router.get('/', tableCtrl.getTables);
router.post('/', [authJwt.verifyToken, authJwt.isModerator], tableCtrl.addTable);
router.get('/:tableId', tableCtrl.getTableById);
router.put('/:tableId', [authJwt.verifyToken, authJwt.isModerator], tableCtrl.updateTableById);
router.delete('/:tableId', [authJwt.verifyToken, authJwt.isAdmin], tableCtrl.deleteTableById);
router.post('/find', [authJwt.verifyToken], tableCtrl.findBestTableForReservation);

export default router;
