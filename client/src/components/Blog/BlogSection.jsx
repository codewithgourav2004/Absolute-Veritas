import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import BlogCard from './BlogCard';
import SectionHeader from '../Common/SectionHeader';
import Loader from '../Common/Loader';

const BlogSection = () => {
  const { data, isLoading } = useQuery('blogs-preview', () =>
    api.get('/blogs?limit=4').then((r) => r.data)
  );

  const blogs = data?.blogs || [];

  return (
    <section className="section-padding bg-pearl">
      <div className="container-max">
        <SectionHeader
          tag="Insights"
          title="Latest from Our Blog"
          subtitle="Stay updated with regulatory news, compliance tips, and industry insights."
        />
        {isLoading ? (
          <Loader />
        ) : blogs.length === 0 ? (
          <div className="text-center text-steel py-12">Blog posts coming soon.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 px-6 py-2 shadow-sm">
            {blogs.map((b, i) => (
              <BlogCard key={b._id} blog={b} index={i} />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link to="/blog" className="btn-primary">View All Articles</Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
