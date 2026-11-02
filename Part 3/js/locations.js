/* ============================================================
   locations.js - the places shown on the Contact page map
   Edit this file to add, change or remove a location. The map
   and the location buttons are built from this list.

   Both police stations below were checked against the official
   SAPS station pages (see the References in README.md):
     address + coordinates = SAPS "Station details" page
   Station TELEPHONE NUMBERS are deliberately left out: the
   numbers published for these stations differ between SAPS
   listings and news reports, so each card links to the SAPS
   page where the current numbers are kept.

   NOT INCLUDED: a Soshanguve Community Forum meeting place.
   No verified address was supplied. To add one later, copy the
   template at the bottom and fill in the real details.
   ============================================================ */
window.FORUM_LOCATIONS = [
  {
    id: 'soshanguve-saps',
    name: 'Soshanguve Police Station (SAPS)',
    type: 'Police station',
    address: '2091 Commissioner Street, Block H, Soshanguve, 0152',
    lat: -25.5287,
    lng: 28.1126,
    sourceLabel: 'SAPS station details: Soshanguve',
    sourceUrl: 'https://www.saps.gov.za/contacts/stationdetails.php?sid=209'
  },
  {
    id: 'rietgat-saps',
    name: 'Rietgat Police Station (SAPS)',
    type: 'Police station',
    address: 'Buitekant Street, Soshanguve, 0152',
    lat: -25.49786,
    lng: 28.09001,
    sourceLabel: 'SAPS station details: Rietgat',
    sourceUrl: 'https://www.saps.gov.za/contacts/stationdetails.php?sid=205'
  }

  /* TEMPLATE for a verified Forum meeting place (remove the slashes
     and fill in real details only when you have a confirmed address):
  ,{
    id: 'forum-meeting-place',
    name: 'Soshanguve Community Forum meeting place',
    type: 'Community Forum',
    address: 'REAL ADDRESS HERE',
    lat: 0,          // real latitude
    lng: 0,          // real longitude
    sourceLabel: 'Confirmed by the Forum',
    sourceUrl: ''
  }
  */
];
