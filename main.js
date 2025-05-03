// main.js
$(document).ready(function () {
  let pelangganData = JSON.parse(localStorage.getItem('pelangganData')) || [];
  let daftarNama = JSON.parse(localStorage.getItem('daftarNama')) || [];

  const paketWifi = {
    'Paket Pemula': 120000,
    'Paket Basic': 150000,
    'Paket Standard': 160000,
    'Paket Premium': 170000,
    'Paket Ultra': 200000
  };

  const dataRekening = {
    bca: '6088777741 (a.n Toko ASEP JAELANI)',
    dana: '083895300118 (a.n ASEP JAELANI)',
    bri: '084701025669538 (a.n ASEP JAELANI)',
    mandiri: '1560017886260 (a.n EUIS JUBAEDAH)'
  };

  function saveData() {
    localStorage.setItem('pelangganData', JSON.stringify(pelangganData));
    localStorage.setItem('daftarNama', JSON.stringify(daftarNama));
  }

  function updateDropdown() {
    $('#nama-pelanggan').empty().append('<option value="">Pilih Nama</option>');
    daftarNama.forEach(nama => {
      if (!pelangganData.find(p => p.nama === nama)) {
        $('#nama-pelanggan').append(`<option value="${nama}">${nama}</option>`);
      }
    });
    $('#nama-pelanggan').select2({ width: '100%' });
  }

  function updateTabel() {
    $('#tabel-body').empty();
    let totalBiaya = 0;
    pelangganData.forEach((data, i) => {
      $('#tabel-body').append(`
        <tr>
          <td>${i + 1}</td>
          <td>${data.nama}</td>
          <td>${data.paket}</td>
          <td>Rp${Math.round(data.biaya).toLocaleString()}</td>
          <td>${data.status}</td>
          <td>${data.payment}</td>
          <td>${data.bank || '-'}</td>
          <td>${data.tanggal}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-btn" data-index="${i}">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-index="${i}">Hapus</button>
          </td>
        </tr>
      `);
      totalBiaya += parseFloat(data.biaya);
    });
    $('#total-biaya').text(`Total Biaya: Rp${Math.round(totalBiaya).toLocaleString()}`);
  }
  
  $('#gunakan-prorate').on('change', function () {
  if ($(this).is(':checked')) {
    $('#prorate-fields').slideDown();
  } else {
    $('#prorate-fields').slideUp();
    $('#tanggal-mulai').val('');
    $('#tanggal-selesai').val('');
    $('#biaya-prorate').text('');
  }
});


  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function hitungProrate(tanggalMulai, tanggalSelesai, biayaBulanan) {
    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    const totalDays = getDaysInMonth(year, month);
    const daysUsed = Math.ceil((endDate - startDate) / (1000 * 3600 * 24)) + 1;
    return (biayaBulanan / totalDays) * daysUsed;
  }

  $('#form-pelanggan').on('submit', function (e) {
  e.preventDefault();

  const nama = $('#nama-pelanggan').val();
  const paket = $('#paket-wifi').val();
  const biayaText = $('#biaya').val().replace(/\D/g, '');
  const biaya = parseInt(biayaText);
  const status = $('#status').val();
  const payment = $('#payment').val();
  const bank = payment === 'transfer' ? $('#bank').val() : '';
  const tanggal = $('#tanggal').val();

  let biayaFinal = biaya;
  if ($('#gunakan-prorate').is(':checked')) {
    const tanggalMulai = $('#tanggal-mulai').val();
    const tanggalSelesai = $('#tanggal-selesai').val();

    if (!tanggalMulai || !tanggalSelesai) {
      alert('Tanggal prorate harus diisi!');
      return;
    }

    biayaFinal = hitungProrate(tanggalMulai, tanggalSelesai, biaya);
    $('#biaya-prorate').text(`Biaya Prorate: Rp${biayaFinal.toLocaleString()}`);
  }

  if (!nama || !paket || isNaN(biayaFinal) || !status || !payment || (payment === 'transfer' && !bank) || !tanggal) {
    alert('Lengkapi semua field!');
    return;
  }

  const dataBaru = { nama, paket, biaya: biayaFinal, status, payment, bank, tanggal };
  pelangganData.push(dataBaru);

  saveData();
  updateTabel();
  updateDropdown();
  this.reset();
  $('#biaya-prorate').text('');
  $('#prorate-fields').hide();
  $('#gunakan-prorate').prop('checked', false);
  $('#nama-pelanggan').val('').trigger('change');
});


  $(document).on('click', '.edit-btn', function () {
    const index = $(this).data('index');
    const data = pelangganData[index];
    $('#form-pelanggan').data('edit-index', index);
    $('#nama-pelanggan').append(`<option value="${data.nama}">${data.nama}</option>`).val(data.nama).trigger('change');
    $('#paket-wifi').val(data.paket);
    $('#biaya').val(Math.round(data.biaya).toLocaleString());
    $('#status').val(data.status);
    $('#payment').val(data.payment).trigger('change');
    $('#bank').val(data.bank);
    $('#tanggal').val(data.tanggal);
  });

  $(document).on('click', '.delete-btn', function () {
    const index = $(this).data('index');
    const nama = pelangganData[index].nama;
    pelangganData.splice(index, 1);
    if (!daftarNama.includes(nama)) daftarNama.push(nama);
    saveData();
    updateDropdown();
    updateTabel();
  });

  $('#payment').on('change', function () {
    if ($(this).val() === 'transfer') {
      $('#bank-group').slideDown();
    } else {
      $('#bank-group').slideUp();
    }
  });

  $('#paket-wifi').on('change', function () {
    const biaya = paketWifi[$(this).val()] || 0;
    $('#biaya').val(biaya.toLocaleString());
  });

  function showLoadingOverlay() {
    $('#loading-overlay').fadeIn('slow');
  }

  function hideLoadingOverlay() {
    setTimeout(() => $('#loading-overlay').fadeOut('slow'), 2000);
  }

  // Inisialisasi
  Object.keys(paketWifi).forEach(p => $('#paket-wifi').append(`<option value="${p}">${p}</option>`));
  updateDropdown();
  updateTabel();
  showLoadingOverlay();
  hideLoadingOverlay();
});
