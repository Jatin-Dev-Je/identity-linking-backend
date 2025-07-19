import { Router } from 'express';
import { IdentityController } from '../controllers/identity.controller';

const router = Router();
const identityController = new IdentityController();

/**
 * @swagger
 * /identify:
 *   post:
 *     summary: Identify and reconcile customer contacts
 *     description: Links customer contacts based on shared email or phone number
 *     tags: [Identity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "lorraine@hillvalley.edu"
 *               phoneNumber:
 *                 type: string
 *                 example: "123456"
 *             minProperties: 1
 *           examples:
 *             emailAndPhone:
 *               summary: Both email and phone
 *               value:
 *                 email: "mcfly@hillvalley.edu"
 *                 phoneNumber: "123456"
 *             emailOnly:
 *               summary: Email only
 *               value:
 *                 email: "lorraine@hillvalley.edu"
 *             phoneOnly:
 *               summary: Phone only
 *               value:
 *                 phoneNumber: "123456"
 *     responses:
 *       200:
 *         description: Contact identified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contact identified successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     contact:
 *                       type: object
 *                       properties:
 *                         primaryContactId:
 *                           type: number
 *                           example: 1
 *                         emails:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"]
 *                         phoneNumbers:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["123456"]
 *                         secondaryContactIds:
 *                           type: array
 *                           items:
 *                             type: number
 *                           example: [23]
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "At least one of email or phoneNumber must be provided"
 *                 error:
 *                   type: string
 *                   example: "At least one of email or phoneNumber must be provided"
 *       500:
 *         description: Internal server error
 */
router.post('/identify', identityController.identify);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the service is running properly
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Service is healthy"
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     service:
 *                       type: string
 *                       example: "Bitespeed Identity Service"
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 */
router.get('/health', identityController.healthCheck);

export default router;
