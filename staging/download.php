<?php

    $filename = tempnam(sys_get_temp_dir(), "1pwd-org-by-caracrist.zip");
    $zip = new ZipArchive();
    $zip->open($filename, ZipArchive::CREATE);

// Create zip

    $zip->addFile("home.html");
    $zip->addFile("home-style.css");
    $zip->addFile("favicon.ico");
    
    $zip->addEmptyDir("scripts");
    $zip->addFile("scripts/builder.js");
    $zip->addFile("scripts/copy.js");
    $zip->addFile("scripts/enc-base64-min.js");
    $zip->addFile("scripts/gen.js");
    $zip->addFile("scripts/getpassword.js");
    $zip->addFile("scripts/lastaction.js");
    $zip->addFile("scripts/localstorage.js");
    $zip->addFile("scripts/manage.js");
    $zip->addFile("scripts/onload.js");
    $zip->addFile("scripts/onmousedetect.js");
    $zip->addFile("scripts/sha3.js");
    
    $zip->addEmptyDir("images");
    $zip->addFile("images/donate-btc.png");
    $zip->addFile("images/help.png");
    $zip->addFile("images/no.png");
    $zip->addFile("images/ok.png");
    $zip->addFile("images/thanks.png");
    $zip->addFile("images/warn.png");
    $zip->close();

// Download Created Zip file

    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="1pwd-org-by-caracrist.zip"');
    header('Content-Length: ' . filesize($filename));
    
    flush();
    readfile($filename);
// Delete file
    unlink($filename);

?>