<?php

/**
 * Database Configuration
 *
 * All of your system's database configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/db.php
 */

return [

    // All environments
    '*'     => [
        // The prefix to use when naming tables. This can be no more than 5 characters.
        'tablePrefix' => 'craft',
    ],

    // Local
    '.local.shcc.nl' => [
        'server'   => 'localhost',
        'database' => 'kraftwerk',
        'user'     => 'root',
        'password' => '',
    ],

    // Development
    'studiokraftwerk.d.shcc.nl' => [
        'server'   => 'localhost',
        'database' => 'v151_studiokraftwerk',
        'user'     => 'v151_kraftwerk',
        'password' => 'uFk8GsyUC0fx',
    ],

    // Staging
    'staging.studiokraftwerk.d.shcc.nl' => [
        'server'   => 'localhost',
        'database' => 'v154_kraftwerk',
        'user'     => 'v154_kraftwerk',
        'password' => 'd3J69G1FkpnD',
    ],

    // Acceptance (treated as production)
    'accept.studiokraftwerk.d.shcc.nl' => [
        'server'   => 'localhost',
        'database' => 'v167_kraftwerk',
        'user'     => 'v167_kraftwerk',
        'password' => 'T6hzlBd8h1dA',
    ],

    // Production
    'studiokraftwerk.com' => [
        'server'   => 'localhost',
        'database' => 'v77_studiokraftwerk',
        'user'     => 'v77_studiokraft',
        'password' => 'rksb18wDVe6I',
    ],
];
