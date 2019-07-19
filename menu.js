(function () {

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    function onGot(item) {

        // document.getElementById('links').checked = item.params.links;
        // document.getElementById('schema').checked = item.params.schema;
        document.getElementById('selection').checked = item.params.selection;
    }

    var getting = browser.storage.sync.get("params");
    getting.then(onGot, onError);


    document.addEventListener('change', function (e) {

        browser.storage.sync.set({
            params: {
                links: false, // document.getElementById('links').checked,
                schema: false, // document.getElementById('schema').checked,
                selection: document.getElementById('selection').checked,
            }
        });

        browser.tabs.query({active: true, currentWindow: true})
            .then(function (tabs) {
                var i, l = tabs.length;
                for (i = 0; i < l; i++) {
                    browser.tabs.sendMessage(tabs[i].id, {
                        command: "edam-popovers:update",
                    });
                }
            })
            .catch(function (err) {

            });
    });

})();