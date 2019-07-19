(function() {
    function onError(error) {
        console.log(`Error: ${error}`);
    }

    function onGot(item) {

        if (item.params.links) {
            detectEdamTermsByLinks();
        }

        if (item.params.selection) {
            detectEdamTermsBySelection();
        }
    }

    function detectEdamTermsByLinks() {

        tippy('a[href^="http://edamontology.org/"]', {
            arrow: true,
            interactive: true,
            content: '<strong>content</strong>',
            delay: [0, 300],
        });

    }

    function detectEdamTermsBySelection() {

        let div = document.createElement('div');
        div.className = 'edam-selection';
        document.body.appendChild(div);

        let tooltip = tippy(div, {
            arrow: true,
            trigger: 'manual',
            interactive: true,
            content: '<strong>content</strong>',
            delay: [0, 300],

        });

        let sheet = (function() {
            let style = document.createElement("style");

            document.head.appendChild(style);

            return style.sheet;
        })();

        function reset() {
            div.className = 'edam-selection';

            div.style.top    = 0;
            div.style.left   = 0;
            div.style.width  = 0;
            div.style.height = 0;

            for (var i = 0; i < sheet.cssRules.length; i++) {
                sheet.deleteRule(0);
            }
        }

        document.documentElement.addEventListener('mouseup', (e) => {

            if (document.querySelector('.edam-tooltip-content') && document.querySelector('.edam-tooltip-content').contains(e.target)) {
                return;
            }

            let selection = getSelection();


            if (!selection.isCollapsed && selection.rangeCount > 0) {
                let range = selection.getRangeAt(0);
                let rangeRect = range.getBoundingClientRect();

                let text = document.getSelection().toString();

                if (text.length > 0) {

                    let match = text.match(/(data_|format_|topic_|operation_)\d{1,4}/);

                    if (match) {
                        let edamTerm = match[0];
                        let className = '';
                        let selectionColor = '';
                        if (match[0].startsWith('data')) {
                            className = 'edam-data';
                            selectionColor = '#E1B2AF';
                        } else if (match[0].startsWith('format')) {
                            className = 'edam-format';
                            selectionColor = '#E4B195';
                        } else if (match[0].startsWith('operation')) {
                            className = 'edam-operation';
                            selectionColor = '#9FB1D4';
                        } else if (match[0].startsWith('topic')) {
                            className = 'edam-topic';
                            selectionColor = '#ADCF9F';
                        } else {
                            return;
                        }

                        div.classList.add(className);
                        sheet.insertRule(`::selection {background-color: ${selectionColor};}`);

                        let edamUri = "http://edamontology.org/" + edamTerm;
                        let edamData = edam_data[edamUri];

                        if (edamData) {
                                tooltip.setContent(`<div class="edam-tooltip-content">
                                 <div><strong>${edamTerm}</strong></div>
                                 <div class="edam-tooltip-content_label">${edamData['label']}</div>
                                 <div class="edam-tooltip-content_synonyms">${edamData['synonyms'].join(' | ')}</div>
                                 <div class="edam-tooltip-content_definition">${edamData['definition']}</div>
                                 <div class="edam-tooltip-content_comments">${edamData['comments'].filter(function(comment) {
                                     return comment !== edamData['definition'];
                                    }).join('<br/>')}</div>
                                 <div class="edam-tooltip-content_version">version: ${edam_data['_version']}</div>
                                 <div class="edam-tooltip-content_links">
                                    <a class="edam-external-link" target="_blank"
                                     href="${edamUri}">
                                    NCBO
                                    </a>
                                    <a class="edam-external-link" target="_blank"
                                     href="https://ifb-elixirfr.github.io/edam-browser/#${edamUri}">
                                    IFB
                                    </a>
                                    <a class="edam-external-link" target="_blank"
                                     href="https://www.ebi.ac.uk/ols/ontologies/edam/terms?iri=${encodeURIComponent(edamUri)}">
                                    EBI
                                    </a>
                                 </div>
                            </div>`);
                        } else {
                            tooltip.setContent(`<div class="edam-tooltip-content">
                                 Not found in version ${edam_data['_version']}.
                            </div>`);
                        }

                        tooltip.show();
                        setTimeout(() => tooltip.show())

                        div.style.top = (rangeRect.top + window.scrollY) +'px';
                        div.style.left = (rangeRect.left + window.scrollX) + 'px';
                        div.style.width = rangeRect.width + 'px';
                        div.style.height = rangeRect.height + 'px';

                    } else {
                        reset();
                    }
                } else {
                    reset();
                }
            } else {
                reset();
            }
        });
    }

    function ready() {
        return new Promise(function(resolve) {
            function checkState() {
                if (document.readyState !== 'loading') {
                    resolve();
                }
            }
            document.addEventListener('readystatechange', checkState);
            checkState();
        });
    }

    ready().then(wrapperResolved);

    function wrapperResolved() {
        var getting = browser.storage.sync.get("params");
        getting.then(onGot, onError);
    }


    browser.runtime.onMessage.addListener(function (message) {
        if (message.command === "edam-popovers:update") {
            var getting = browser.storage.sync.get("params");
            getting.then(onGot, onError);
        }
    });
})();