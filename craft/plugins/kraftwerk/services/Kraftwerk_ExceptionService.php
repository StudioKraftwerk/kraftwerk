<?php
namespace Craft;

use Jenssegers\Agent\Agent;
use Airbrake\Client;
use Airbrake\Configuration;


/**
 * Class Kraftwerk_ExceptionService
 *
 * @author    Sara Gerion <sara@superherocheesecake.com>
 * @package   Craft
 * @copyright Superhero Cheesecake
 */
class Kraftwerk_ExceptionService extends BaseApplicationComponent
{

    /**
     * The airbrake client
     *
     * @var Client
     */
    protected $airbrake_client;

    /**
     * Are exceptions enabled for this environment
     *
     * @var bool
     */
    protected $exceptions_enabled;

    /**
     * Codebase api key
     *
     * @var string
     */
    protected $codebase_api_key;

    /**
     * The ignored exception classes
     *
     * @var array
     */
    protected $ignored_types;

    /**
     * The ignored exception status codes
     *
     * @var array
     */
    protected $ignored_statuses;


    /**
     * Vodafone_ExceptionService constructor.
     */
    public function __construct()
    {
        $this->exceptions_enabled = craft()->config->get('exceptionsNotifying');
        $this->codebase_api_key   = craft()->config->get('codebaseApikey');
        $this->ignored_types      = craft()->config->get('exceptionsIgnoredTypes');
        $this->ignored_statuses   = craft()->config->get('exceptionsIgnoredStatusCodes');

        $config                = new Configuration($this->codebase_api_key, $this->getNotificationsOptions());
        $this->airbrake_client = new Client($config);

    }

    /**
     *
     * @return array
     */
    protected function getNotificationsOptions()
    {
        return [
            'apiEndPoint'     => 'https://exceptions.codebasehq.com/notifier_api/v2/notices',
            'environmentName' => craft()->config->get('environment'),
            'timeout'         => 10,
        ];
    }

    /**
     * Register exceptions listener
     */
    public function registerExceptionsListener()
    {

        // Check if exceptions logging is enabled for this environment
        if ($this->exceptions_enabled) {

            craft()->onException = function (\CExceptionEvent $event) {

                $exception = $event->exception;

                // Exceptions to ignore
                // Notify only if it's a relevant exception
                if ($this->isToIgnore($exception)) {
                    return;
                }

                // Tell Codebase
                $this->airbrake_client->notifyOnException($exception);

            };
        }
    }


    /**
     * Checks if the exception is to be ignored
     *
     * @param $exception
     *
     * @return bool
     */
    protected function isToIgnore($exception)
    {

        foreach ($this->ignored_types as $class) {
            if (is_a($exception, $class)) {
                return true;
            }
        }
        foreach ($this->ignored_statuses as $ignored_status) {
            if ($exception->statusCode == (string)$ignored_status) {
                return true;
            }
        }

        return false;
    }

}