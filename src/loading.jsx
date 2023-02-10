import { Spin } from 'antd';

const PageLoading = ({
    isLoading,
    pastDelay,
    timedOut,
    error,
    retry,
    ...reset
}) => (
    <div style={{ paddingTop: 100, textAlign: 'center' }}>
        <Spin size='large' {...reset} />
    </div>
);

export default PageLoading;
