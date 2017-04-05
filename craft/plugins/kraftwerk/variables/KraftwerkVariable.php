<?php
namespace Craft;

use Jenssegers\Agent\Agent;

/**
 * Class KraftwerkVariable
 *
 * @author    Sara Gerion <sara@superherocheesecake.com>
 * @package   Craft
 * @copyright Superhero Cheesecake
 */
class KraftwerkVariable
{

    /**
     * Type constants
     *
     * @var string
     */
    const TYPE_MOBILE  = 'mobile';
    const TYPE_TABLET  = 'tablet';
    const TYPE_DESKTOP = 'desktop';

    /**
     * @var Agent
     */
    protected $agent;

    /**
     * @var array
     */
    private $_desktop_support = [
        'Chrome'  => 39,
        'Firefox' => 34,
        'IE'      => 11,
        'Safari'  => 8,
    ];

    /**
     * @var array
     */
    private $_mobile_support = [
        'iOS'       => 8,
        'AndroidOS' => 4.1,
    ];

    /**
     * Creates a new instance of Device
     */
    public function __construct()
    {
        $this->agent = new Agent();
    }

    /**
     * Determine the request type
     *
     * @return boolean
     */
    public function isJson()
    {
        return craft()->kraftwerk_request->isJSON();
    }

    /**
     * Returns the agent object
     *
     * @return Agent
     */
    public function getAgent()
    {
        return $this->agent;
    }

    /**
     * Checks if the current UA is mobile
     *
     * @return bool
     */
    public function isMobile()
    {
        return ($this->agent->isMobile() && !$this->agent->isTablet());
    }

    /**
     * Checks if the current UA is desktop
     *
     * @return bool
     */
    public function isDesktop()
    {
        return $this->agent->isDesktop();
    }

    /**
     * Checks if the current UA is tablel
     *
     * @return bool
     */
    public function isTablet()
    {
        return $this->agent->isTablet();
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->agent->device();
    }

    /**
     * Returns the device type
     *
     * @return string
     */
    public function getType()
    {
        if ($this->agent->isTablet()) {
            return self::TYPE_TABLET;
        }

        if ($this->agent->isMobile()) {
            return self::TYPE_MOBILE;
        }

        return self::TYPE_DESKTOP;
    }

    /**
     * Returns the device object on an array format
     *
     * @return array
     */
    public function deviceArray()
    {
        return [
            'type'    => $this->getType(),
            'name'    => $this->getName(),
            'os'      => $this->agent->platform(),
            'version' => $this->agent->version($this->agent->platform()),
        ];
    }

    /**
     * Convert the object to its JSON representation.
     *
     * @param  int $options
     *
     * @return string
     */
    public function deviceJson($options = 0)
    {
        return json_encode($this->deviceArray(), $options);
    }

    /**
     * Determine if the browser is outdated
     *
     * @return boolean
     */
    public function isBrowserOutdated()
    {
        // Detect desktop browsers.
        if ($this->agent->isDesktop()) {
            $browser = $this->agent->browser();

            $version = $this->agent->version($browser);
            $version = floatval(preg_replace('/(^[0-9]+(\.[0-9]+)?).*/', '$1', $version));

            return (isset($this->_desktop_support[$browser]) && $this->_desktop_support[$browser] > $version);

            // Detect mobile devices.
        } else {
            $os = $this->agent->platform();

            $version = $this->agent->version($os);
            $version = floatval(preg_replace('/(^[0-9]+(\.[0-9]+)?).*/', '$1', $version));

            return (isset($this->_mobile_support[$os]) && $this->_mobile_support[$os] > $version);
        }
    }

    /**
     * Redirect outdated browsers
     *
     * @param string $section_handle
     */
    public function redirectOutdatedBrowser($section_handle = null)
    {
        if ($section_handle !== 'errorBrowser' && $this->isBrowserOutdated()) {

            craft()->request->redirect('/oldbrowser');
        }
    }

}
