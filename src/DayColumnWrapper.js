import React from 'react'
import PropTypes from 'prop-types'

const DayColumnWrapper = ({
  children,
  className,
  style,
  dataProps,
  innerRef,
}) => {
  return (
    <div {...dataProps} className={className} style={style} ref={innerRef}>
      {children}
    </div>
  )
}

DayColumnWrapper.propTypes = {
  dataProps: PropTypes.shape({}),
  innerRef: PropTypes.shape({}),
}

export default React.forwardRef((props, ref) => (
  <DayColumnWrapper {...props} innerRef={ref} />
))
