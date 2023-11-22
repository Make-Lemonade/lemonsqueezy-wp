import "./styles.editor.scss";
import { registerBlockType } from "@wordpress/blocks";
import { getColorClassName } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import Edit from "./edit";

const attributes = {
    content: {
        type: "string"
    },
    overlay: {
        type: "boolean"
    },
    store: {
        type: "string"
    },
    product: {
        type: "string"
    },
    textColor: {
        type: 'string'
    },
    customTextColor: {
        type: 'string'
    },
    backgroundColor: {
        type: 'string'
    },
    customBackgroundColor: {
        type: 'string'
    },
    prefillUserData: {
        type: "boolean",
        default: false
    },
    prefillFromURL: {
        type: "boolean",
        default: false
    },
    customData: {
        type: "array",
        default: []
    }
};

registerBlockType("lemonsqueezy/ls-button", {
    title: "Lemon Squeezy",
    description: __("The Lemon Squeezy Product Block", "lemonsqueezy"),
    category: "lemonsqueezy",
    icon: (
        <svg
            width="118"
            height="160"
            viewBox="0 0 118 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M39.5904 98.2021L82.512 118.046C87.8317 120.507 91.5868 124.636 93.6147 129.373C98.7439 141.369 91.7337 153.638 80.7288 158.05C69.7222 162.46 57.9919 159.622 52.6582 147.147L33.9787 103.35C32.5312 99.9554 36.1675 96.6196 39.5904 98.2021"
                fill="#000000"
            />
            <path
                d="M42.1685 85.3576L86.4746 68.6093C101.2 63.0429 117.285 73.5749 117.068 88.8779C117.064 89.0776 117.061 89.2773 117.056 89.4787C116.738 104.381 101.1 114.396 86.6984 109.124L42.2105 92.8416C38.6616 91.5435 38.6354 86.693 42.1685 85.3576"
                fill="#000000"
            />
            <path
                d="M39.6849 79.5563L83.2393 61.0496C97.7126 54.8992 101.386 36.4398 90.0502 25.7741C89.9017 25.6336 89.7531 25.4949 89.6027 25.3561C78.4895 15.0407 60.1177 18.6727 53.791 32.2595L34.2463 74.237C32.6869 77.5847 36.2112 81.0321 39.6849 79.5563"
                fill="#000000"
            />
            <path
                d="M28.4769 72.243L44.312 28.8235C46.2753 23.4399 45.9116 17.9496 43.882 13.2125C38.7423 1.22159 24.8232 -2.64901 13.8201 1.76994C2.81875 6.19058 -3.39781 16.2301 1.9464 28.7L20.7482 72.4494C22.2062 75.8394 27.2147 75.7057 28.4769 72.243"
                fill="#000000"
            />
        </svg>
    ),
    keywords: [
        __("ecommerce", "lemonsqueezy", "product", "digital"),
        __("digital products", "lemonsqueezy")
    ],
    attributes,
    deprecated: [{
        attributes,
        save: ({ attributes }) => {
            const { content, overlay, product  } = attributes;
            let link = product;
            let className = [
                'wp-block-button__link',
            ];

            if ( overlay ) {
                className.push('lemonsqueezy-button');
                link = product + "?embed=1";
            }

            return (
                <div className="wp-block-buttons">
                    <div className="wp-block-button">
                        <a className={className.join( ' ')} href={link}>
                            {content}
                        </a>
                    </div>
                </div>
            )
        }
    }],
    edit: Edit,
    save: ({ attributes }) => {
        const { content, overlay, product, textColor, customTextColor, backgroundColor, customBackgroundColor } = attributes;
        let link = product;
        let divStyles = {};
        let className = [
            'wp-block-button__link',
        ];

        if ( overlay ) {
            className.push('lemonsqueezy-button');
            link = product + "?embed=1";
        }

        if (textColor != undefined) {
            className.push( getColorClassName('color', textColor) );
        }

        if (backgroundColor != undefined) {
            className.push( getColorClassName('background-color', backgroundColor) );
        }

        if (customTextColor != undefined) {
            divStyles.color = customTextColor;
        }

        if (customBackgroundColor != undefined) {
            divStyles.backgroundColor = customBackgroundColor;
        }

        return (
            <div className="wp-block-buttons">
                <div className="wp-block-button">
                    <a style={divStyles} className={className.join( ' ')} href={link}>
                        {content}
                    </a>
                </div>
            </div>
        );
    }
});
