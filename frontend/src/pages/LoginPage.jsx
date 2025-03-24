const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', formData);
      console.log('Login response:', response.data);
      
      // Store token and admin data
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminData', JSON.stringify({
        id: response.data.admin.id,
        name: response.data.admin.name,
        email: response.data.admin.email,
        role: response.data.admin.role,
        permissions: response.data.admin.permissions
      }));
      
      toast.success('Login successful!');
      navigate('/overview');
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }; 