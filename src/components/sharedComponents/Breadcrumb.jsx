import { Link } from 'react-router';

function Breadcrumb({ title }) {
  return (
    <section className="mb-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="col-xl-6">
            <div className="breadcrumb_content">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {title}
                </li>
              </ol>
              <h1 className="breadcrumb_title">{title}</h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Breadcrumb;