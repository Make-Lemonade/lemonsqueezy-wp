import "./styles.editor.scss";
import { registerBlockType } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import Edit from "./edit";

const attributes = {
  content: {
      type: "string",
  },
  overlay: {
    type: "boolean",
  },
  product: {
      type: "string"
  },
};

registerBlockType("lemonsqueezy/ls-button", {
    title: "Lemon Squeezy",
    description: __('The Lemon Squeezy Product Block', 'lemonsqueezy'),
    category: "lemonsqueezy",
    icon: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    ),
    keywords: [__('ecommerce', 'lemonsqueezy', 'product', 'digital'), __('digital products', 'lemonsqueezy')],
    attributes,
    deprecated: [],
    edit: Edit,
    save: ({ attributes }) => {

      const {
        content,
        overlay,
        product,
    } = attributes;

        const embed_link = product + '?embed=1';
   
        return (
          overlay
          ?
          <div className="wp-block-buttons">
            <div className="wp-block-button">
            <a className="wp-block-button__link lemonsqueezy-button" href={embed_link}>{content}</a>
            </div>
          </div>
            :
            <div className="wp-block-buttons">
              <div className="wp-block-button">
              <a className="wp-block-button__link" href={product}>{content}</a>
              </div>
          </div>
        );
    }
});