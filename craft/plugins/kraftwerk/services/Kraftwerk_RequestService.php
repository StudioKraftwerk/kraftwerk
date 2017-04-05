<?php
namespace Craft;

class Kraftwerk_RequestService extends BaseApplicationComponent
{
    /**
     * Returns the request parameters that will be used for action parameter binding.
     *
     * By default, this method will return $_GET merged with {@link UrlManager::getRouteParams}.
     *
     * @return array The request parameters to be used for action parameter binding.
     */
    public function getActionParams()
    {
        $params      = $_GET;
        $routeParams = craft()->urlManager->getRouteParams();

        if (is_array($routeParams)) {
            $params = array_merge($params, $routeParams);
        }

        return $params;
    }

    /**
     * Determines the type of request based on the GET variables.
     *
     * @return boolean
     */
    public function isJSON()
    {
        return isset($_SERVER['CONTENT_TYPE']) && $_SERVER['CONTENT_TYPE'] == 'application/json';
    }
}
