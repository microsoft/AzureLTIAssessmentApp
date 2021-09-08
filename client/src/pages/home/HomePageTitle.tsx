import React from 'react'
import { Helmet } from 'react-helmet'

const title = 'Assessment App | Home'

export const HomePageTitle = () => {
    return (
        <>
            <Helmet>
                <title>{ title }</title>
            </Helmet>
        </>
    )
}
