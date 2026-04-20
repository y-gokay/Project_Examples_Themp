/* eslint-disable react/prop-types */
import { Layout } from 'antd';
import { Header } from 'antd/es/layout/layout';

const { Content } = Layout;



function MainLayout({ children }) {
  return (
    <Layout style={{minHeight: "100vh"}} className='h-100'>
      <Content style={{minHeight: "100vh"}} className='h-100'>
        {children}
      </Content>
    </Layout>
  );
}

export default MainLayout;