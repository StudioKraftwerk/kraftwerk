<?php
namespace Craft;

/**
 * Class KraftwerkPlugin
 *
 * @author    Sara Gerion <sara@superherocheesecake.com>
 * @package   Craft
 * @copyright Superhero Cheesecake
 */
class KraftwerkPlugin extends BasePlugin
{


    /**
     *
     */
    public function init()
    {
        craft()->kraftwerk_exception->registerExceptionsListener();
    }

    /**
     *
     * @return null|string
     */
    function getName()
    {
        return Craft::t('Kraftwerk');
    }

    /**
     *
     * @return string
     */
    function getVersion()
    {
        return '1.0.0';
    }

    /**
     *
     * @return string
     */
    function getDeveloper()
    {
        return 'Sara Gerion';
    }

    /**
     *
     * @return string
     */
    function getDeveloperUrl()
    {
        return 'http://www.superherocheesecake.com';
    }

    /**
     *
     * @return bool
     */
    function hasCpSection()
    {
        return false;
    }

    /**
     *
     * @return array
     */
    protected function defineSettings()
    {
        return [

        ];
    }

    /**
     *
     * @return mixed
     */
    public function getSettingsHtml()
    {
        return craft()->templates->render('kraftwerk/settings', [
            'settings' => $this->getSettings(),
        ]);
    }
}
