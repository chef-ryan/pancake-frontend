import React from 'react'
import { Text, QuestionHelper, QuestionHelperProps } from '@pancakeswap/uikit'

interface Props extends Pick<QuestionHelperProps, 'placement'> {
  label?: React.ReactNode
  children?: React.ReactNode
}

const QuestionToolTip: React.FC<Props> = ({ label, placement, children }) => (
  <QuestionHelper placement={placement} text={<Text fontSize="sm">{label}</Text>}>
    {children}
  </QuestionHelper>
)

export default QuestionToolTip
