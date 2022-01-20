import React from 'react'
import { Helmet } from 'react-helmet'

const title = 'Question Bank'

export const QuestionBankPageTitle = () => {
    return (
        <>
            <Helmet>
                <title>{ title }</title>
            </Helmet>
        </>
    )
}
