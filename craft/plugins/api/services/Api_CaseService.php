<?php
namespace Craft;

use Craft\Api_EntryService;

/**
 * Class Api_CaseService
 *
 * @author    Sara Gerion <sara@superherocheesecake.com>
 * @package   Craft
 * @copyright Superhero Cheesecake
 */
class Api_CaseService extends Api_EntryService
{

    /**
     * String that defines the featured cases in url pa
     */
    const TYPE_FEATURED = 'featured';

    /**
     * Retrieve all the Cases items.
     *
     * @return ElementCriteriaModel
     */
    protected function getAllItems()
    {
        $items          = craft()->elements->getCriteria(ElementType::Entry);
        $items->section = 'case';
        $items->limit   = null;

        return $items;
    }

    /**
     * Retrieve the Cases items based on type.
     *
     * @return ElementCriteriaModel
     */
    public function getItems($cases_type = null)
    {
        switch ($cases_type) {
            case self::TYPE_FEATURED:
                return $this->getFeaturedItems();
            default:
                return $this->getAllItems();
        }
    }

    /**
     * Retrieve the Cases items.
     *
     * @return ElementCriteriaModel
     */
    public function getFeaturedItems()
    {
        $items          = craft()->elements->getCriteria(ElementType::Entry);
        $items->section = 'homepage';
        $items->limit   = null;

        return $items;
    }

    /**
     * Retrieve the Stories items.
     *
     * @return ElementCriteriaModel
     */
    public function getItem($id)
    {
        $items          = craft()->elements->getCriteria(ElementType::Entry);
        $items->section = 'case';
        $items->id      = $this->getDecodedID($id);
        $items->limit   = null;

        return $items->first();
    }


}
