import styled from 'styled-components'

const colors = ['#EFF4F5', '#EEEAF4']
export const AdTag = ({ title, value, index }: { title: string; value: string; index: number }) => {
  const color = colors[index % colors.length]
  return (
    <TagBox
      style={{
        backgroundColor: color,
      }}
    >
      <Title>{title}</Title>
      <Value>{value}</Value>
    </TagBox>
  )
}

const Title = styled.div`
  font-family: Kanit;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 2%;
`
const Value = styled.div`
  font-family: Kanit;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
  letter-spacing: 0%;
`

const TagBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  margin-right: 4px;
  padding-top: 2px;
  padding-right: 10px;
  padding-bottom: 2px;
  padding-left: 10px;
`
