import moment from 'moment';

function AdminFooter() {
  return (
    <section className="py-6 border-t border-border bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center">
          <div className="w-full text-center">
            <p className="text-muted">
              © {moment().format('YYYY')} CostaHQ. Made by Aman Rajvanshi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminFooter;