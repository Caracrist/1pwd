<?php

$to      = 'support@1pwd.org, caracrist@gmail.com';
$subject = 'Feedback from: '. $_GET['email'];
$message = wordwrap($_GET['text'], 70);
$headers = array(
    'From' => 'Feedback Form <feedback@1pwd.org>',
    'X-Mailer' => 'PHP/' . phpversion()
);

mail($to, $subject, $message, $headers);
?>