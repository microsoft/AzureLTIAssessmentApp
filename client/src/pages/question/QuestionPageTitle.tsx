import React from 'react'
import { Helmet } from 'react-helmet'

const title = 'Question'

export const QuestionPageTitle = () => {
    return (
        <>
            <Helmet>
                <title>{ title }</title>
            </Helmet>
        </>
    )
}
