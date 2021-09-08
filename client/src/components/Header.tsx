import React from 'react';
import {
    styled,
    Text,
    Separator,
    FontWeights,
    Image,
    IImageStyleProps,
    IImageStyles,
    AnimationClassNames,
    getTheme, Link
} from '@fluentui/react';
import {SimpleComponentStyles, IStylesOnly, IThemeOnlyProps} from '../utils/FluentUI/typings.fluent-ui';
import {themedClassNames} from '../utils/FluentUI';
import {UserDetails} from './UserDetails';
import {useHistory} from 'react-router-dom';

interface HeaderProps {
    mainHeader?: string;
    secondaryHeader?: string;
    logoUrl?: string;
}

type HeaderStyles = SimpleComponentStyles<'root' | 'mainContent' | 'mainHeader' | 'separator' | 'secondaryHeader' | 'userSection'>;
const HeaderInner = ({
                         mainHeader,
                         secondaryHeader,
                         logoUrl,
                         styles
                     }: IStylesOnly<HeaderStyles> & HeaderProps): JSX.Element => {
    let history = useHistory();
    const redirectHome = () => {
        history.push('/')
    };
    const classes = themedClassNames(styles);
    return (
        <div className={classes.root} id="top-header">
            <div className={classes.mainContent}>
                {logoUrl && <Image src={logoUrl} styles={imageStyles} height={40}/>}
                <Link style={{
                    textDecoration: "none"
                }}>
                    <Text style={{color: 'white'}} variant="xLargePlus" className={classes.mainHeader}
                          onClick={redirectHome}>
                        {mainHeader}
                    </Text>
                </Link>
                {secondaryHeader && <Separator vertical className={classes.separator}/>}
                <Text style={{color: 'white'}} variant="xLarge" className={classes.secondaryHeader}>
                    {secondaryHeader}
                </Text>
            </div>
            <div className={classes.userSection}>
                <UserDetails/>
            </div>
        </div>
    );
};

const headerStyles = ({theme}: IThemeOnlyProps): HeaderStyles => ({
    root: [
        {
            width: '100%',
            backgroundColor: theme.palette.themePrimary,
            color: theme.palette.white,
            boxShadow: theme.effects.elevation8,
            display: 'flex',
            position: 'sticky',
            zIndex: 2
        }
    ],
    mainContent: [
        {
            padding: `${theme.spacing.s2} ${theme.spacing.s1}`,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        }
    ],
    mainHeader: [
        {
            fontWeight: FontWeights.regular,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginLeft: theme.spacing.m
        }
    ],
    separator: [
        {
            margin: `0 ${theme.spacing.s1}`,
            selectors: {
                ':after': {
                    backgroundColor: theme.palette.whiteTranslucent40
                }
            }
        }
    ],
    secondaryHeader: [
        {
            fontWeight: FontWeights.regular,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }
    ],
    userSection: [
        {
            marginLeft: 'auto'
        }
    ]
});

const imageStyles = ({isLoaded}: IImageStyleProps): Partial<IImageStyles> => {
    const theme = getTheme();
    return {
        root: [
            isLoaded &&
            (AnimationClassNames.slideRightIn40,
                {
                    marginLeft: theme.spacing.s1
                })
        ],
        image: [
            {
                maxWidth: 150,
                maxHeight: '100%',
                objectFit: 'contain'
            }
        ]
    };
};
export const Header = styled(HeaderInner, headerStyles);
