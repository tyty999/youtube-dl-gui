'use strict'
const customTitlebar = require('custom-electron-titlebar')
const Menu = remote.Menu;

let stepper
let downloadPath = remote.app.getPath('downloads');

if(process.platform === "darwin") {
    new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#212121'),
        maximizable: false,
        shadow: false,
        titleHorizontalAlignment: "center",
        enableMnemonics: false,
        icon: "web-resources/icon-light.png"
    })
} else {
    new customTitlebar.Titlebar({
        backgroundColor: customTitlebar.Color.fromHex('#000000'),
        maximizable: false,
        shadow: true,
        titleHorizontalAlignment: "left",
        enableMnemonics: false,
        icon: "web-resources/icon-light.png"
    })
}

$(document).ready(function () {
    stepper = new Stepper($('.bs-stepper')[0], {
       linear: true,
       animation: true
    })
    $('#error').toast({
        autohide: false,
        animation: true
    })
    $('#warning').toast({
        autohide: false,
        animation: true
    })
    $('#connection').toast({
        autohide: false,
        animation: true
    })
    $("#directoryInputLabel").html(remote.app.getPath('downloads'))
    $("#max,#min").keydown(function () {
        if (!$(this).val() || (parseInt($(this).val()) <= parseInt($(this).attr("max")) && parseInt($(this).val()) > 0)) $(this).data("old", $(this).val())
    })
    $("#max,#min").keyup(function () {
        if (!(!$(this).val() || (parseInt($(this).val()) <= parseInt($(this).attr("max")) && parseInt($(this).val()) > 0))) $(this).val($(this).data("old"))
    })
    $("#max, #min").on('input', function() {
        if($("#max").val() === "" || $("#min").val() === "") return
        applyRange()
        updateAvailableFormats()
        if($('input[name=type-select]:checked').val() === "video") {
            $('.size').html('<b>Download size: </b>' + getTotalSize(availableVideoFormats[availableVideoFormats.length - 1].format_note))
        } else {
            $('.size').html('<b>Download size: </b> ~' + getTotalSize())
        }
    });
})

$(document).on('click','.close',function (e) {
    $(this).closest('.toast').css('visibility','hidden')
});

function setDirectory() {
    $('#directoryInput').blur();
    let path = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        defaultPath: downloadPath,
        properties: [
            'openDirectory',
            'createDirectory'
        ]
    }).then(result => {
        $('#directoryInputLabel').html(result.filePaths[0])
        downloadPath = result.filePaths[0]
    })
}

function showWarning() {
    $('#warning').toast('show')
    $('#warning').css('visibility','visible')
}

function showError(err) {
    $('.error-body').html(err.toString())
    $('#error').toast('show')
    $('#error').css('visibility','visible')
}

const InputMenu = Menu.buildFromTemplate([{
    label: 'Cut',
    role: 'cut',
}, {
    label: 'Copy',
    role: 'copy',
}, {
    label: 'Paste',
    role: 'paste',
}, {
    type: 'separator',
}, {
    label: 'Select all',
    role: 'selectall',
},
]);

document.body.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();

    let node = e.target;

    while (node) {
        if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
            InputMenu.popup(remote.getCurrentWindow());
            break;
        }
        node = node.parentNode;
    }
});
