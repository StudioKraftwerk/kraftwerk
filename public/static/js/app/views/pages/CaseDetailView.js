define([
    'superhero',
    'app/utils/ScrollManager',
    'app/modules/VideoModule',
    'app/modules/GalleryModule',
    'app/views/components/CaseSectionComponent',
    'app/views/components/CaseFooterComponent',
    'app/views/components/MenuIconComponent'
], function(Superhero, ScrollManager, VideoModule, GalleryModule, CaseSectionComponent, CaseFooterComponent, MenuIconComponent) {

    return Superhero.View.extend({

        className: 'page page-case-detail',

        ui: {
            sections: '.section'
        },

        components: {
            section: {selector: '.section', module: CaseSectionComponent},
            video: {selector: '.section-video', module: VideoModule},
            gallery: {selector: '.section-image-gallery', module: GalleryModule},
            menuIcon: {selector: '.button-main-menu', module: MenuIconComponent},
            footer: {selector: '.case-footer', module: CaseFooterComponent}
        },

    });

});
