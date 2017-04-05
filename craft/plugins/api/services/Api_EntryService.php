<?php
namespace Craft;

use Hashids\Hashids;

/**
 * Class Api_EntryService
 *
 * @author    Sara Gerion <sara@superherocheesecake.com>
 * @package   Craft
 * @copyright Superhero Cheesecake
 */
class Api_EntryService extends BaseApplicationComponent
{

    /**
     * @var Hashids
     */
    protected $hashed_ids_handler;

    /**
     * Api_EntryService constructor.
     */
    public function __construct()
    {
        $this->hashed_ids_handler = new Hashids(
            craft()->config->get('applicationKey'),
            craft()->config->get('hashedIdsLength'),
            craft()->config->get('hashedIdsAlphabet')
        );
    }

    /**
     * @param $id
     *
     * @return string
     */
    public function getEncodedID($id)
    {
        return $this->hashed_ids_handler->encode($id);
    }

    /**
     * @param $hashed_id
     *
     * @return array
     */
    public function getDecodedID($hashed_id)
    {
        return $this->hashed_ids_handler->decode($hashed_id);
    }

}
