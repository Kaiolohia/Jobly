const express = require("express");
const { ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const router = new express.Router();
const Job = require('../models/job');
const jsonschema = require("jsonschema");


const jobNewSchema = require('../schemas/jobNew.json');
const jobUpdateSchema = require('../schemas/jobUpdate.json');

router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const validator = jsonschema(req.body, jobNewSchema);
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({ job })
    } catch (e) {
        next(e)
    }
})

router.get("/", async function (req, res, next) {
    try {
      const job = await Job.findAll(req.query);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

router.get("/:handle", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.handle);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

  router.patch("/:handle", ensureLoggedIn, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.update(req.params.handle, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

router.delete("/:handle", ensureLoggedIn, async function (req, res, next) {
    try {
      await Job.remove(req.params.handle);
      return res.json({ deleted: req.params.handle });
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;