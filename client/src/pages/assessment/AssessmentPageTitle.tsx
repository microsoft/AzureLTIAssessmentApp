import React from 'react'
import { Helmet } from 'react-helmet'

const title = 'Assessment App | Assessment'

export const AssessmentPageTitle = () => {
    return (
        <>
            <Helmet>
                <title>{ title }</title>
            </Helmet>
        </>
    )
}
