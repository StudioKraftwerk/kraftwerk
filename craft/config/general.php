<?php

/**
 * General Configuration
 *
 * All of your system's general configuration settings go in here.
 * You can see a list of the default settings in craft/app/etc/config/defaults/general.php
 */

return [

    /**
     * All Environments Configuration
     *
     * All of your system's general configuration settings go in here.
     */
    '*'                                 => [
        'environment'           => 'production',
        'cpTrigger'             => 'cms',
        'isSystemOn'            => true,

        /**
         * Paths
         */
        'basePath'              => __DIR__ . '../../../public',
        'projectPath'           => __DIR__ . '/../..',

        /**
         * Metadata
         */
        'cacheBuster'           => '1.2.3',
        'minifiedResources'     => true,
        'facebookAppId'         => '123456',
        'description'           => 'Description',
        'keywords'              => 'keywords',
        'errorTemplatePrefix'   => "error/",

        /**
         * Application settings
         */
        'siteUrl'               => 'https://www.studiokraftwerk.com',
        'devMode'               => false,
        'timezone'              => 'Europe/Amsterdam',
        'omitScriptNameInUrls'  => true,
        'useCompressedJs'       => false,
        'enableCsrfProtection'  => true,
        'backupDbOnUpdate'      => true,
        'applicationKey'        => '4fskPvzxHutYn66hI02R31Pom0GR2cPz',

        /**
         * Hashed IDs settings
         */
        'hashedIdsLength'       => 8,
        'hashedIdsAlphabet'     => 'abcdefghij1234567890',

        /**
         * Caching
         */
        'enableTemplateCaching' => true,
        'cacheDuration'         => 'P1D', // 1 hour
        'cacheMethod'           => 'file',

        /**
         * Codebase exceptions
         */
        'codebaseApikey'               => 'eb12261f-7a62-456d-d160-16e5530a861e',
        'exceptionsNotifying'          => true,
        'exceptionsIgnoredStatusCodes' => [400, 401, 402, 403, 404, 405],
        'exceptionsIgnoredTypes'       => [],

    ],

    /**
     * Local Environment Configuration
     *
     * All of your system's local general configuration settings go in here.
     */
    '.local.shcc.nl'                    => [
        'environment'       => 'local',
        'isSystemOn'        => true,

        /**
         * Application settings
         */
        'devMode'           => true,
        'siteUrl'           => 'https://studio-kraftwerk.local.shcc.nl',

        /**
         * Metadata
         */
        // 'siteName'              => 'title',
        'minifiedResources' => false,
        'facebookAppId'     => '123456',
    ],

    /**
     * Development Environment Configuration
     *
     * All of your system's development general configuration settings go in here.
     */
    'studiokraftwerk.d.shcc.nl'         => [
        'environment'       => 'development',
        'isSystemOn'        => true,

        /**
         * Application settings
         */
        'devMode'           => true,
        'siteUrl'           => 'http://studiokraftwerk.d.shcc.nl',

        /**
         * Metadata
         */
        // 'siteName'              => 'title',
        'minifiedResources' => false,
        'facebookAppId'     => '123456',
    ],

    /**
     * Staging Environment Configuration
     *
     * All of your system's development general configuration settings go in here.
     */
    'staging.studiokraftwerk.d.shcc.nl' => [
        'environment'       => 'staging',
        'isSystemOn'        => true,

        /**
         * Application settings
         */
        'devMode'           => false,
        'siteUrl'           => 'http://staging.studiokraftwerk.d.shcc.nl',

        /**
         * Metadata
         */
        // 'siteName'              => 'title',
        'minifiedResources' => true,
        'facebookAppId'     => '123456',
    ],

    /**
     * Accept Environment Configuration
     *
     * All of your system's development general configuration settings go in here.
     */
    'accept.studiokraftwerk.d.shcc.nl'  => [

        /**
         * Application settings
         */
        'siteUrl' => 'http://accept.studiokraftwerk.d.shcc.nl',

    ],


];
