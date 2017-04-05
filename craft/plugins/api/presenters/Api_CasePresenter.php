<?php namespace Craft;

use Craft\Api_EntryService;
use Craft\EntryModel;
use Craft\ElementCriteriaModel;
use Illuminate\Support\Facades\Validator;

/**
 * Class Api_CasePresenter
 *
 * @author    Sara Gerion <sara@superherocheesecake.com>
 * @package   Craft
 * @copyright Superhero Cheesecake
 */
class Api_CasePresenter
{

    /**
     * @var \Craft\Api_EntryService
     */
    protected $entry_service;

    /**
     * Api_CasePresenter constructor.
     */
    public function __construct()
    {
        $this->entry_service = new Api_EntryService();
    }

    /**
     * Presents Stories items
     *
     * @param \Craft\ElementCriteriaModel $items
     *
     * @return array
     */
    public function presentItems(ElementCriteriaModel $items)
    {

        $formatted_entries = [];
        foreach ($items as $order => $item) {

            $formatted_entries[] = [
                'id'                      => $this->entry_service->getEncodedID($item->id),
                'slug'                    => $item->slug,
                "order"                   => $order,
                'title'                   => $item->title,
                'heading'                 => $item->heading,
                'image'                   => ($item->image->first()) ? $item->image->first()->getUrl() : "",
                'header_image'            => ($item->headerImage->first()) ? $item->headerImage->first()->getUrl() : "",
                'header_background_image' => ($item->headerBackgroundImage->first()) ? $item->headerBackgroundImage->first()->getUrl() : "",
                "header_button"           => $item->headerButton,
                "header_button_url"       => $item->headerButtonUrl,
                "project_type"            => $item->projectType,
                "client"                  => $item->client,
            ];
        }

        return $formatted_entries;
    }

    /**
     * Presents Stories items
     *
     * @param \Craft\ElementCriteriaModel $items
     *
     * @return array
     */
    public function presentFeaturedItems(ElementCriteriaModel $items)
    {

        $formatted_entries = [];
        foreach ($items as $homepage_item) {
            foreach ($homepage_item->featuredCases as $order => $item) {

                $formatted_entries[] = [
                    'id'                      => $this->entry_service->getEncodedID($item->id),
                    'slug'                    => $item->slug,
                    "order"                   => $order,
                    'title'                   => $item->title,
                    'heading'                 => $item->heading,
                    'image'                   => ($item->image->first()) ? $item->image->first()->getUrl() : "",
                    'header_image'            => ($item->headerImage->first()) ? $item->headerImage->first()->getUrl() : "",
                    'header_background_image' => ($item->headerBackgroundImage->first()) ? $item->headerBackgroundImage->first()->getUrl() : "",
                    "header_button"           => $item->headerButton,
                    "header_button_url"       => $item->headerButtonUrl,
                    "project_type"            => $item->projectType,
                    "client"                  => $item->client,
                ];
            }
        }

        return $formatted_entries;
    }

    /**
     * Presents a Case item
     *
     * @param \Craft\EntryModel $item
     *
     * @return array
     */
    public function presentItem(EntryModel $item)
    {
        return [
            'id'                => $this->entry_service->getEncodedID($item->id),
            'slug'              => $item->slug,
            'title'             => $item->title,
            'heading'           => $item->heading,
            'slug'              => $item->slug,
            'preview_image_url' => ($item->headerImage->first()) ? $item->headerImage->first()->getUrl() : "",
            "client"            => $item->client,
        ];;
    }


}
