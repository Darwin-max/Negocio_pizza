const express = require("express");
const whatsappController = require("../controllers/whatsapp.controller");

const router = express.Router();

router.get("/webhook", whatsappController.verificarWebhook);
router.post(
  "/webhook",
  express.json({
    verify: (req, res, body) => {
      req.rawBody = Buffer.from(body);
    },
  }),
  whatsappController.recibirWebhook
);

module.exports = router;
