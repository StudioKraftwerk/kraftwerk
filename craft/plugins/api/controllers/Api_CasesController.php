<?php namespace Craft;

use Craft\EntryModel;

/**
 * Class Api_StoriesController
 *
 * @author    Sara Gerion <sara@superherocheesecake.com>
 * @package   Craft
 * @copyright Superhero Cheesecake
 */
class Api_CasesController extends Api_BaseController
{
    /**
     * The get parameter that identifies the type in the request url
     */
    const TYPE_PARAMETER = 'type';

    /**
     * The get parameter that identifies the case in the request url
     */
    const CASE_PARAMETER = 'id';

    /**
     * @var Api_CasePresenter|null
     */
    protected $case_presenter;

    /**
     * Api_CasesController constructor.
     *
     * @param      $id
     * @param null $module
     */
    public function __construct($id, $module = null)
    {
        parent::__construct($id, $module);
        $this->case_presenter = new Api_CasePresenter();
    }


    /**
     * Show a collection of case items
     *
     * @throws HttpException
     */
    public function actionIndex()
    {
        // Makes sure it's a GET request
        $this->requireGetRequest();

        $cases_type = craft()->request->getParam(self::TYPE_PARAMETER);

        if (!empty($cases_type)) {
            $entries = craft()->api_case->getItems($cases_type);
            switch ($cases_type) {
                case Api_CaseService::TYPE_FEATURED:
                    $formatted_entries = $this->case_presenter->presentFeaturedItems($entries);
                    break;
                default:
                    $formatted_entries = $this->case_presenter->presentItems($entries);
                    break;
            }
        } else {
            $entries           = craft()->api_case->getItems();
            $formatted_entries = $this->case_presenter->presentItems($entries);
        }

        $this->returnJson($formatted_entries);

    }

    /**
     * Show a single case item
     *
     * @throws HttpException
     */
    public function actionShow()
    {
        // Makes sure it's a GET request
        $this->requireGetRequest();

        $entry_id = craft()->request->getParam(self::CASE_PARAMETER);
        if (empty($entry_id)) {
            $this->returnJson([]);
        }

        $item = craft()->api_case->getItem($entry_id);
        if (!$item instanceof EntryModel) {
            $this->returnJson([]);
        }

        $formatted_entries = $this->case_presenter->presentItem($item);
        $this->returnJson($formatted_entries);

    }


}
