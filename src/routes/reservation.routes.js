import { Router } from "express";
const router = Router();

import * as reservationCtrl from '../controllers/reservation.controller.js';
import { authJwt } from "../middlewares/index.js";

router.get('/', [authJwt.verifyToken, authJwt.isAdminOrModerator], reservationCtrl.getReservations);
router.post('/', [authJwt.verifyToken], reservationCtrl.addReservation);
router.get('/:reservationId', reservationCtrl.getReservationById);
router.put('/:reservationId', [authJwt.verifyToken], reservationCtrl.updateReservationById);
router.delete('/:reservationId', [authJwt.verifyToken, authJwt.isAdmin], reservationCtrl.deleteReservationById);
router.post('/cancel/:reservationId', [authJwt.verifyToken], reservationCtrl.cancelReservationById);
router.get('/user/:userId', [authJwt.verifyToken], reservationCtrl.getReservationsByUserId);
router.get('/table/:tableNumber', [authJwt.verifyToken, authJwt.isModerator], reservationCtrl.getReservationsByTableNumber);

export default router;
