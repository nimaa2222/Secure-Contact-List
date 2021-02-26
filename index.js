var express = require('express');
var router = express.Router();

var ensureLoggedIn = function(req, res, next) {
	if ( req.user ) {
		next();
	}
	else {
		res.redirect("/login");
	}
}

/* GET home page. */
router.get('/mailer', async function(req, res, next) {
  res.render('mailer');
});

/* The Thank You Page for form submission! */
router.post('/thanks', async function(req, res, next) {
  await add_contact(req);
  res.render('thanks');
});

/* The Thank You Page for contact info update! */
router.post('/thanks_update', async function(req, res, next) {
  await update_contact(req);
  res.render('thanks_update');
});

/* The list of contacts page */
router.get('/contacts', ensureLoggedIn, async function(req, res, next) { 
  await get_all_contacts();
  res.render('contacts', {contacts: contact_list});
});

/* requests for contact deletion */
router.get(/delete/, ensureLoggedIn, async function(req, res, next) { 
  await delete_contact(req);
  await get_all_contacts();
  res.render('contacts', {contacts: contact_list});
});

/* page to update contact information */
router.get(/update/, ensureLoggedIn, async function(req, res, next) { 
  await get_contact_info(req);
  res.render('update', {contact: contact_edit});
});


module.exports = router;



