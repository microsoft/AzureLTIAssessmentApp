import React from 'react'
import { Helmet } from 'react-helmet'

const title = 'Platform Registration'

export const PlatformPageTitle = () => {
        return (
            <>
                <Helmet>
                    <title>{ title }</title>
                </Helmet>
            </>
        )
}
