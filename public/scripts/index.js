/* global $ noteful api store */
'use strict';

$(document).ready(function () {
  noteful.bindEventListeners();

  // Promisified Solution
  api.search({})
    .then(response => {
      store.notes = response;
      noteful.render();
    });

  // DRY Solution
  // noteful.doSearchAndRender();
});
