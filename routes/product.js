const express = require("express");
const db = require("../models");
const auth = require("../middleware/auth");
const router = express.Router();
const Joi = require('joi');

function validateProduct(product) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(255).required(),
    price: Joi.number().required(),
  });

  return schema.validate(product);
}

router.get("/", auth, async (req, res) => {
  const products = await db.Product.findAll();
  res.json(products);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateProduct(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { name, description, price } = req.body;

  try {
    const product = await db.Product.create({ name, description, price });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  try {
    const product = await db.Product.findByPk(id);
    if (product) {
      product.name = name;
      product.description = description;
      product.price = price;
      await product.save();
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await db.Product.findByPk(id);
    if (product) {
      await product.destroy();
      res.status(204).end();
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
