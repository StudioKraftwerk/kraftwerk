<?php
namespace Craft;

/**
 * Class ApiPlugin
 *
 * @author    Sara Gerion <sara@superherocheesecake.com>
 * @package   Craft
 * @copyright Superhero Cheesecake
 */
class ApiPlugin extends BasePlugin
{
    function init()
    {
        parent::init();
        require_once craft()->config->get('projectPath'). '/vendor/autoload.php';
    }

    /**
     *
     * @return null|string
     */
    function getName()
    {
        return Craft::t('REST api');
    }

    /**
     *
     * @return string
     */
    function getVersion()
    {
        return '0.1.0';
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
        return 'http://www.superherocheesecake.com/';
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
     */
    public function getSettingsHtml()
    {
        return;
    }
}
