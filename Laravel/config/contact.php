<?php

return [

    'admin_email' => env('ADMIN_EMAIL'),

    'message_max' => (int) env('CONTACT_MESSAGE_MAX', 5000),

    'throttle' => [
        'max_attempts' => (int) env('CONTACT_THROTTLE_MAX', 3),
        'decay_minutes' => (int) env('CONTACT_THROTTLE_DECAY', 5),
    ],

];
