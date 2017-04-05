<?php namespace Craft;

/**
 * Class Api_BaseController
 *
 * @author    Sara Gerion <sara@superherocheesecake.com>
 * @package   Craft
 * @copyright Superhero Cheesecake
 */
abstract class Api_BaseController extends BaseController
{

    /**
     * @var bool
     */
    protected $allowAnonymous = true;

    /**
     * Api_BaseController constructor.
     *
     * @param      $id
     * @param null $module
     */
    public function __construct($id, $module = null )
    {
        parent::__construct($id, $module);;
    }

    /**
	 * Throws a 400 error if this isn’t a GET request
	 *
	 * @throws HttpException
	 * @return null
	 */
	public function requireGetRequest()
	{
		if (craft()->request->getRequestType() !== 'GET')
		{
			throw new HttpException(400);
		}
	}

}
