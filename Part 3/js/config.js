/* ============================================================
   config.js - settings you can change without touching other files
   ============================================================ */
window.FORUM_CONFIG = {

  /* How the Enquiry and Contact forms are sent:
       'netlify' = send through Netlify Forms (only works once the site
                   is deployed on Netlify - see README.md)
       'none'    = never send; the forms only check the details
     This file contains NO passwords or secret keys, and it does not
     contain the Forum's email address. The receiving email address is
     set inside the Netlify dashboard (see README.md). */
  formDelivery: 'netlify'
};
